#!/usr/bin/env python3
"""Generate static blog pages from the Google Sheets JSON API."""

import html
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
TEMPLATE_DIR = os.path.join(SCRIPT_DIR, 'blog_templates')
BLOG_DIR = os.path.join(PROJECT_ROOT, 'blog')
LISTING_OUTPUT = os.path.join(PROJECT_ROOT, 'blogs.html')
SITEMAP_PATH = os.path.join(PROJECT_ROOT, 'sitemap.xml')
SITE_BASE = 'https://togkf.in'
URL_TITLE_PATTERN = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')

EMPTY_LISTING = """
        <div style="text-align: center; padding: 4rem 0;">
          <h2 style="font-size: 2rem; margin-bottom: 1rem;">Coming Soon</h2>
          <p style="font-size: 1.2rem; color: #666; max-width: 600px; margin: 0 auto; line-height: 1.8;">
            New articles are on the way. Check back soon for updates from TOGKF India.
          </p>
        </div>
"""


def load_template(name):
    path = os.path.join(TEMPLATE_DIR, name)
    with open(path, encoding='utf-8') as f:
        return f.read()


def fetch_posts(script_url):
    script_url = script_url.strip()
    raw = _fetch_url(script_url)

    if not raw:
        raise RuntimeError(
            'Apps Script returned an empty response. '
            'Open BLOG_SCRIPT_URL in a browser — it should show {"posts":[...]}. '
            'Ensure the web app is deployed with access set to "Anyone".'
        )

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        preview = raw[:300].replace('\n', ' ')
        raise RuntimeError(
            'Apps Script did not return JSON. '
            'Open BLOG_SCRIPT_URL in a browser — it should show {"posts":[...]}. '
            f'Response preview: {preview}'
        )

    if 'error' in data:
        raise RuntimeError(data['error'])
    return data.get('posts', [])


def _fetch_url(url):
    """Fetch URL body. Prefer curl -L for Google Apps Script redirect chains."""
    if shutil.which('curl'):
        result = subprocess.run(
            ['curl', '-sL', '--max-time', '60', url],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            raise RuntimeError(f'curl failed ({result.returncode}): {result.stderr.strip()}')
        return result.stdout.strip()

    headers = {'User-Agent': 'Mozilla/5.0 (compatible; togkf-blog-generator/1.0)'}
    current_url = url
    for _ in range(8):
        req = urllib.request.Request(current_url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as response:
            raw = response.read().decode('utf-8').strip()
            final_url = response.geturl()
        if raw:
            return raw
        if final_url != current_url:
            current_url = final_url
            continue
        break
    return ''


def escape(text):
    return html.escape(str(text) if text is not None else '', quote=True)


def format_date_display(date_str):
    try:
        if isinstance(date_str, str) and 'T' not in date_str and len(date_str) == 10:
            dt = datetime.strptime(date_str[:10], '%Y-%m-%d')
        else:
            dt = datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
        return dt.strftime('%d %B %Y')
    except (ValueError, TypeError):
        return escape(date_str)


def format_date_iso(date_str):
    try:
        if isinstance(date_str, str) and 'T' not in date_str and len(date_str) == 10:
            return date_str[:10]
        dt = datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
        return dt.date().isoformat()
    except (ValueError, TypeError):
        return escape(date_str)


def body_to_html(body):
    if not body:
        return ''
    paragraphs = [p.strip() for p in str(body).split('\n\n') if p.strip()]
    return '\n          '.join(f'<p>{escape(p)}</p>' for p in paragraphs)


def sanitize_url_title(url_title):
    slug = str(url_title).strip().lower()
    if not URL_TITLE_PATTERN.match(slug):
        raise ValueError(f'Invalid url_title "{url_title}" — use lowercase letters, numbers, and hyphens only.')
    return slug


def build_card(post):
    url_title = sanitize_url_title(post['url_title'])
    title = escape(post.get('title', ''))
    excerpt = escape(post.get('excerpt', ''))
    date_display = format_date_display(post.get('date_published', ''))
    date_iso = format_date_iso(post.get('date_published', ''))
    image = post.get('image', '')
    article_url = f'/blog/{url_title}'

    if image:
        img_block = (
            f'<div class="blog-card-img-wrap">'
            f'<img src="{escape(image)}" alt="{title}" class="blog-card-img" loading="lazy">'
            f'</div>'
        )
        card_class = 'blog-card'
    else:
        img_block = ''
        card_class = 'blog-card blog-card-noimg'

    return f"""
        <article class="{card_class}">
          {img_block}
          <div class="blog-card-body">
            <time class="blog-date" datetime="{date_iso}">{date_display}</time>
            <h3>{title}</h3>
            <p class="blog-card-excerpt">{excerpt}</p>
            <a href="{article_url}" class="blog-read-link">Read article <i class="fas fa-arrow-right"></i></a>
          </div>
        </article>"""


def build_article_page(post, template):
    url_title = sanitize_url_title(post['url_title'])
    title = escape(post.get('title', ''))
    description = escape(post.get('excerpt') or post.get('title', ''))
    canonical = f'{SITE_BASE}/blog/{url_title}'
    og_image = escape(post.get('image') or f'{SITE_BASE}/assets/togkf_logo.png')
    date_display = format_date_display(post.get('date_published', ''))
    date_iso = format_date_iso(post.get('date_published', ''))
    body = body_to_html(post.get('body', ''))

    if post.get('image'):
        hero = (
            f'<img src="{escape(post["image"])}" alt="{title}" class="blog-hero-img" loading="lazy">'
        )
    else:
        hero = ''

    page = template
    replacements = {
        '{{TITLE}}': title,
        '{{DESCRIPTION}}': description,
        '{{CANONICAL}}': canonical,
        '{{OG_IMAGE}}': og_image,
        '{{DATE_DISPLAY}}': date_display,
        '{{DATE_ISO}}': date_iso,
        '{{HERO_IMAGE}}': hero,
        '{{BODY}}': body,
    }
    for key, value in replacements.items():
        page = page.replace(key, value)
    return page, url_title


def update_sitemap(url_titles):
    with open(SITEMAP_PATH, encoding='utf-8') as f:
        content = f.read()

    content = re.sub(
        r'\n   <url>\n      <loc>https://togkf\.in/blog/[^<]+</loc>.*?</url>',
        '',
        content,
        flags=re.DOTALL,
    )

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    blog_entries = []
    for url_title in url_titles:
        blog_entries.append(
            f"""   <url>
      <loc>{SITE_BASE}/blog/{url_title}</loc>
      <lastmod>{today}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
   </url>"""
        )

    insert_block = '\n'.join(blog_entries)
    blogs_marker = '      <loc>https://togkf.in/blogs</loc>'
    if insert_block and blogs_marker in content:
        blogs_block_end = content.find('</url>', content.find(blogs_marker)) + len('</url>')
        content = content[:blogs_block_end] + '\n' + insert_block + content[blogs_block_end:]
    elif insert_block:
        content = content.replace('</urlset>', insert_block + '\n</urlset>')

    if blogs_marker not in content:
        blogs_index = f"""   <url>
      <loc>{SITE_BASE}/blogs</loc>
      <lastmod>{today}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
   </url>"""
        content = content.replace('</urlset>', blogs_index + '\n</urlset>')

    with open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
        f.write(content)


def clean_stale_articles(active_titles):
    if not os.path.isdir(BLOG_DIR):
        return
    for name in os.listdir(BLOG_DIR):
        path = os.path.join(BLOG_DIR, name)
        if os.path.isdir(path) and name not in active_titles:
            shutil.rmtree(path)
            print(f'Removed stale article: blog/{name}/')


def generate_blog_pages():
    script_url = os.environ.get('BLOG_SCRIPT_URL', '').strip()
    if not script_url:
        print('Error: BLOG_SCRIPT_URL environment variable is not set.')
        sys.exit(1)

    print(f'Fetching posts from {script_url}...')
    posts = fetch_posts(script_url)
    print(f'Found {len(posts)} verified post(s).')

    listing_template = load_template('listing.html')
    article_template = load_template('article.html')

    if posts:
        cards = '\n'.join(build_card(post) for post in posts)
        listing_content = f'<div id="blog-list">{cards}\n        </div>'
    else:
        listing_content = EMPTY_LISTING

    listing_html = listing_template.replace('{{CONTENT}}', listing_content)
    with open(LISTING_OUTPUT, 'w', encoding='utf-8') as f:
        f.write(listing_html)
    print(f'Wrote {LISTING_OUTPUT}')

    os.makedirs(BLOG_DIR, exist_ok=True)
    active_titles = []

    for post in posts:
        page_html, url_title = build_article_page(post, article_template)
        article_dir = os.path.join(BLOG_DIR, url_title)
        os.makedirs(article_dir, exist_ok=True)
        article_path = os.path.join(article_dir, 'index.html')
        with open(article_path, 'w', encoding='utf-8') as f:
            f.write(page_html)
        active_titles.append(url_title)
        print(f'Wrote blog/{url_title}/index.html')

    clean_stale_articles(set(active_titles))
    update_sitemap(active_titles)
    print(f'Updated {SITEMAP_PATH}')
    print('Blog generation complete.')


if __name__ == '__main__':
    generate_blog_pages()

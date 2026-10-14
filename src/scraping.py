import os
import sys
import json
import feedparser
from bs4 import BeautifulSoup

movies_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../assets/movies.json")

rss_url = "https://letterboxd.com/pinktownscvngr/rss/"
feed = feedparser.parse(rss_url)

# Keep the existing movies.json if the feed is unreachable or empty
if not feed.entries:
    print(f"No entries fetched from {rss_url}; leaving movies.json unchanged.")
    sys.exit(0)

recent_movies = []
for entry in feed.entries[:4]:

    full_title = entry.title
    if ", " in full_title:
        title, _ = full_title.rsplit(", ", 1)
    else:
        title, _ = full_title, "Unknown Year"

    link = entry.link

    description_html = entry.description
    soup = BeautifulSoup(description_html, "html.parser")
    poster = soup.find("img")
    poster_image = poster.get("src", "") if poster else ""

    recent_movies.append({
        "title": f"{title}",
        "link": link,
        "poster": poster_image
    })

with open(movies_file_path, "w", encoding="utf-8") as json_file:
    json.dump(recent_movies, json_file, ensure_ascii=False, indent=4)

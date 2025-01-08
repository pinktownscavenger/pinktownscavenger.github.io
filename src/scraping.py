import os
import json
import feedparser
from bs4 import BeautifulSoup

index_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../index.html")
movies_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../movies.json")

rss_url = "https://letterboxd.com/pinktownscvngr/rss/"
feed = feedparser.parse(rss_url)

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
    poster_image = soup.find("img")["src"] if soup.find("img") else ""

    recent_movies.append({
        "title": f"{title}",
        "link": link,
        "poster": poster_image
    })

with open(movies_file_path, "w", encoding="utf-8") as json_file:
    json.dump(recent_movies, json_file, ensure_ascii=False, indent=4)
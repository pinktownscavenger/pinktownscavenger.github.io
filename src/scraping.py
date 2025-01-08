import feedparser
from bs4 import BeautifulSoup

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

with open("index.html", "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "html.parser")

movie_list = soup.find("ul", class_="movie-list")
if movie_list:
    movie_list.clear()

    for movie in recent_movies:
        li = soup.new_tag("li", **{"class": "movie-card"})
        a = soup.new_tag("a", href=movie["link"], target="_blank")
        img = soup.new_tag("img", src=movie["poster"], alt="Movie Poster", **{"class": "movie-poster"})
        a.append(img)
        li.append(a)
        movie_list.append(li)

with open("index.html", "w", encoding="utf-8") as file:
    formatted_html = soup.prettify()
    file.write(formatted_html)
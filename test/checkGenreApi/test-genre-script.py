import requests
import json

list_of_genres = ["*Non-fiction", "Action & Adventure", "Ancient", "Animals & Nature", "Anthologies", "Antiquity", "Art", "Asian Antiquity", "Astronomy", "Atheism & Agnosticism", "Ballads", "Bibles", "Biography & Autobiography", "Business & Economics", "Chemistry", "Children", "Children's Fiction", "Children's Non-fiction", "Christian Fiction", "Christianity - Biographies", "Christianity - Commentary", "Christianity - Other", "Classics (Antiquity)", "Comedy", "Contemporary", "Cooking & Food", "Courses", "Crafts & Hobbies", "Crime & Mystery Fiction", "Culture & Heritage", "Design & Architecture", "Detective Fiction", "Drama", "Dramatic Readings", "Early Modern", "Earth Sciences", "Education", "Elegies & Odes", "Epics", "Epistolary Fiction", "Erotica", "Espionage", "Essays & Short Works", "Exploration", "Family & Relationships", "Fantasy", "Fiction", "Fictional Biographies & Memoirs", "Foreign Language Study", "Free Verse", "Games", "Gardening", "General Fiction", "Gothic Fiction", "Health & Fitness", "Historical", "Historical Fiction", "History", "Horror", "House & Home", "Humor", "Humor (Fiction)", "Law", "Legends & Fairy Tales", "Letters", "Life Sciences", "Literary Collections", "Literary Criticism", "Literary Fiction", "Literature", "Lyric", "Magical Realism", "Mathematics", "Medical", "Medieval", "Memoirs", "Middle Ages/Middle History", "Modern", "Modern (19th C)", "Modern (20th C)", "Music", "Mystery", "Myths", "Narratives", "Nature", "Nature Fiction", "Nautical & Marine Fiction", "Performing Arts", "Philosophy", "Physics & Mechanics", "Plays", "Poetry", "Political & Thrillers", "Political Science", "Politics", "Psychology", "Published 1800 -1900", "Published 1900 onward", "Published before 1800", "Radio", "Reference", "Religion", "Religious Fiction", "Romance", "Sagas", "Satire", "School", "Science", "Science Fiction", "Self Help", "Short Stories", "Short non-fiction", "Short works", "Single Author Collections", "Social Science", "Sonnets", "Spirituality", "Sports & Recreation", "Sports Fiction", "Suspense", "Technology & Engineering", "Tragedy", "Transportation", "Travel", "Travel & Geography", "Travel Fiction", "True Crime", "Vo", "War & Military", "War & Military Fiction", "Western", "Writing & Linguistics", "Young Adult Literature"]

list_of_good_genre = []
for genre in list_of_genres:
    url = f"https://librivox.org/api/feed/audiobooks/"
    params = {"genre": genre, "format": "json", "limit": "1"}
    r = requests.get(url, params=params, timeout=3)
    if r.status_code == 200:
        list_of_good_genre.append(genre)
        print(f"{genre} good")
    else:
    	pass
list_of_good_genre = json.dumps(list_of_good_genre)
print(list_of_good_genre)


import urllib.request
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

os.makedirs("img/modes", exist_ok=True)

# Alternative URLs for missing images
images = {
    "mode-cs.jpg": [
        "https://wallpapercave.com/wp/wp10756345.jpg",
        "https://wallpapercave.com/wp/wp5219025.jpg",
        "https://wallpapercave.com/wp/wp4677356.jpg",
        "https://i.pinimg.com/736x/8f/c9/2c/8fc92c2195f0fc98150ea13b192ea129.jpg",
    ],
    "mode-headshot.jpg": [
        "https://wallpapercave.com/wp/wp10413894.jpg",
        "https://wallpapercave.com/wp/wp6621987.jpg",
        "https://wallpapercave.com/wp/wp6218434.jpg",
        "https://i.pinimg.com/736x/11/a6/f3/11a6f3b06db2388062de396959b8beec.jpg",
    ],
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
    'Referer': 'https://wallpapercave.com/'
}

for filename, urls in images.items():
    saved = False
    for url in urls:
        try:
            print(f"Trying {url} for {filename}...")
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                data = response.read()
                if len(data) > 10000:  # At least 10KB
                    filepath = os.path.join("img/modes", filename)
                    with open(filepath, "wb") as f:
                        f.write(data)
                    size = os.path.getsize(filepath)
                    print(f"  OK: Saved {filename} ({size//1024} KB)")
                    saved = True
                    break
                else:
                    print(f"  Too small ({len(data)} bytes), trying next...")
        except Exception as e:
            print(f"  Failed: {e}")
    if not saved:
        print(f"  All URLs failed for {filename}")

print("Done!")

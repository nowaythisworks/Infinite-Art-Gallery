# Infinite-Art-Gallery
### [Click for Demo!](https://infinite-art-gallery.brazil-0034.repl.co/)
3D Infinite Procedurally-Generated Art Gallery! This pulls from Reddit's r/Art and creates a procedural infinite art gallery from random (sfw-only) posts.

Rendered entirely with THREE.JS in the browser. (May) require a server couterpart to host and filter posts from the Reddit, Harvard Art Museum, and Met APIs.

## How It Works
- First, a world is created (using a ceiling and a floor tile) using a Minecraft-style chunk system. This way, the world will traverse (mostly) infinitely no matter what direction you move in.
- Then, we use a middleman server to send random images from Reddit's art-related subreddits to the client. This can be intensive and the server is prone to crashing when there are too many people, so if there's any better solutions please contribute or post in the issues tab :))
- We generate the images randomly 30 meters in front of the player. There is a 10% chance every second for an image to generate, and once it is generated, there is a mandated cooldown of ~~10~~ 5 seconds.

## TODO
- ~~Mobile Phone Support!!!!!!! (figure out how to do controls on a phone)~~ DONE! This one was really hard.
- Proper Crediting - right now, the server will etch the artist's name onto the image file. This is both hard to read and computationally intensive (and possibly a licensing violation in some cases?), so maybe a plaque with the author and title could be better. Unfortunately, Reddit's API is prone to many (many) issues and we can't just direct-link the image without the middleman server.
- More World Details - like a random potted plant or maybe a sculpture or vase here and there, to fill in the void.
- ~~Firefox Support~~ Done!
- ~~Mouse Direction Reversal~~ Done!

![front board and tutorial](https://user-images.githubusercontent.com/66288732/185100953-3f2e287d-b06c-4140-a500-f01a32982888.png)
![art piece in preview](https://user-images.githubusercontent.com/66288732/185100745-2bb8a35d-71ad-4fb5-b9b7-0c800acf6cda.png)

"""Simple dev server for SPA frontend - serves index.html for all routes."""
import http.server
import os

DIRECTORY = os.path.join(os.path.dirname(__file__), "public")


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Serve actual files if they exist
        path = self.translate_path(self.path)
        if os.path.isfile(path):
            return super().do_GET()
        # Otherwise serve index.html for SPA routing
        self.path = "/index.html"
        return super().do_GET()


if __name__ == "__main__":
    server = http.server.HTTPServer(("0.0.0.0", 3000), SPAHandler)
    print("Frontend dev server running at http://localhost:3000")
    server.serve_forever()

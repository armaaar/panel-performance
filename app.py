import os

import panel as pn
from panel.template import MaterialTemplate
from panel.viewable import Viewer

# Panel configurations
pn.extension(notifications=True)

pn.config.profiler = "pyinstrument"
pn.config.defer_load = True
pn.config.global_loading_spinner = True
pn.config.throttled = True
# enable multithreading, letting Panel set the number of threads based on os.cpu_count()
pn.config.nthreads = 0

# https://panel.holoviz.org/how_to/concurrency/threading.html
print(f"nthreads: {min(32, os.cpu_count() + 4)}")


class TestPage(Viewer):
    def deferred_contents(self):
        return pn.pane.Markdown("Hello, world!")

    def __panel__(self):
        template = MaterialTemplate(title="Panel Performance")

        template.main.append(self.deferred_contents)

        return template


# Serve Panel app
pn.serve(
    panels={"/": TestPage},
    port=5555,
    admin=True,
    show=False,
    autoreload=False,
    verbose=True,
    location=True,
)

# Verbatim from https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui
# ("How it works"). Not imported anywhere: this backend does not install the
# `copilotkit` Python package, and the snippet uses names the page never
# defines (surface_id, components, data). Shown on /generative-ui/a2ui.
from copilotkit import a2ui

a2ui.create_surface(surface_id, catalog_id=...)
a2ui.update_components(surface_id, components)
a2ui.update_data_model(surface_id, {"items": data})
a2ui.render(operations=[...])  # wraps in a2ui_operations and serializes

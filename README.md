# MoonsterBooth 🧌
Turn yourself into a Halloween-styled character and get an original roast with the power of AI.
Capture image via web interface --> Get a Halloween-like image and a roast --> Print via an Instax Polaroid printer

# Installation
1. Clone or fork this repository
2. Paste your Replicate API token in [backend/app.py](https://github.com/saharmor/MonsterBooth/blob/main/backend/app.py#L20)
3. Install and run the web interface `cd web-interface && yarn install && yarn start`
4. Create and run a virtual environment for the backend `cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
5. In the same terminal from Step #3, run the backend Flask server `python3 app.py`

# Todos
- [ ] Integrate with an Instax camera using [InstaxBLE](https://github.com/javl/InstaxBLE) or [instax_api](https://github.com/jpwsutton/instax_api), so when a user clicks _Print!_, an image is getting printed via the connected Instax printer

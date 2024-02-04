from datetime import datetime
import requests
from flask import Flask, request, jsonify
import base64
from io import BytesIO
from PIL import Image
from flask_cors import CORS
import os
import random
import replicate

app = Flask(__name__)
CORS(app, origins="http://localhost:3000")

DEST_EMAIL = 'test@gmail.com'
SENDER_EMAIL = 'test@gmail.com'
# https://www.getmailbird.com/gmail-app-password/
GMAIL_APP_TOKEN = 'YOUR_GMAIL_APP_TOKEN'
REPLICATE_API_TOKEN = 'YOUR_REPLICATE_API_TOKEN'

os.environ['SENDER_EMAIL'] = SENDER_EMAIL
os.environ['GMAIL_APP_TOKEN'] = GMAIL_APP_TOKEN
os.environ['REPLICATE_API_TOKEN'] = REPLICATE_API_TOKEN


prompt_styles = {
    'marvel comics': 'Marvel comics, colorful',
    'pixar': 'as pixar characters, colorful',
    'dracula': 'attractive dracula with fangs, fireball eyes, sexy, spooky, model',
    'scary': 'spider crypt, dimly lit, scary',
    'zombie': 'zombie, undead, scary, green light',
    'creepy doll': 'creepy doll, cracked porcelain, one missing eye, old attic',
    'ghostly': 'ghostly apparition, ancient mansion, eerie mist, moonlit night',

    'vibrant': 'vivid and lively image, vibrant colors, distinct style, abstract background, colorful patterns',
}
# 'gory scene undead, blood, gore, scary',
# 'Magical fairy, pinky, wings, sparkles',
# 'Emotive eyes, Intense gazes, Contemplative mood, Expressive gestures, Stylized poses',
# 'Bold colors, Stylized portraits, Famous faces, Pop art still life, Pop art landscapes'


def send_email(image_path: str, dest_email: str):
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.base import MIMEBase
    from email import encoders

    # Your Gmail account
    from_address = os.getenv("SENDER_EMAIL")
    # follow this guide to create such a token for your Gmail account https://stackoverflow.com/questions/72480454/sending-email-with-python-google-disables-less-secure-apps
    password = os.getenv("GMAIL_APP_TOKEN")

    # Create the email header
    msg = MIMEMultipart()
    msg["From"] = from_address
    msg["To"] = dest_email
    msg["Subject"] = "Scenery reimagined with Monocle + AI ✨"

    # Open the file in bynary mode
    binary_file = open(image_path, "rb")

    # Then we create the MIMEBase object to store the image
    mime_image = MIMEBase("image", "jpeg")
    # And read it into the MIMEBase object
    mime_image.set_payload(binary_file.read())

    # We encode the image in base64 and add the headers so that the email client knows it's an attachment
    encoders.encode_base64(mime_image)
    mime_image.add_header("Content-Disposition",
                          f"attachment; filename= {image_path}")
    msg.attach(mime_image)

    # We then connect to the Gmail server
    server = smtplib.SMTP("smtp.gmail.com", 587)

    # We start the server
    server.starttls()

    # Login to the server
    server.login(from_address, password)

    # Convert the MIMEMultipart object to a string
    text = msg.as_string()

    # And finally send the email
    server.sendmail(from_address, dest_email, text)
    server.quit()


@app.route('/email-img', methods=['POST'])
def email_new_pic():
    return {'error': 'No URL provided'}, 400

    data = request.get_json()
    imgUrl = data.get('imgUrl')
    if imgUrl:
        try:
            response = requests.get(imgUrl, stream=True)
            img_path = 'uploaded_image.jpg'
            with open(img_path, 'wb') as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
            # send_email(img_path, DEST_EMAIL)
            return {'message': 'Image saved successfully'}, 200
        except Exception as e:
            return {'error': str(e)}, 500

    return {'error': 'No URL provided'}, 400


def save_imgs_to_dir(org_img, generated_img_url):
    dir_name = f'backend/output/{datetime.now().strftime("%I.%M%p_%d-%m-%Y")}'
    os.makedirs(dir_name, exist_ok=True)

    # save original image
    org_img.save(os.path.join(dir_name, "original_image.jpg"))

    # Download the image
    response = requests.get(generated_img_url)
    image_data = response.content

    file_path = os.path.join(dir_name, "scarified_image.jpg")
    with open(file_path, "wb") as file:
        file.write(image_data)


@app.route('/scarify_image', methods=['POST'])
def scarify():
    file = request.files.get('file')
    prompt_style = request.form.get('prompt_style')
    buffered_reader = BytesIO(file.read())

    if prompt_style == 'surprise me':
        prompt = random.choice(list(prompt_styles.values()))
    else:
        prompt = prompt_styles[prompt_style]

    print(f'Submitting new image + prompt [{prompt}]')
    try:
        # output = 'https://cdn.yogajournal.com/wp-content/uploads/2021/09/NikePant.jpg?width=730'
        output = replicate.run(
            "usamaehsan/controlnet-1.1-x-realistic-vision-v2.0:51778c7522eb99added82c0c52873d7a391eecf5fcc3ac7856613b7e6443f2f7",
            input={"image": buffered_reader,
                   'prompt': prompt,
                   'negative_prompt': '(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck'
                   },

        )
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)})

    try:
        save_imgs_to_dir(Image.open(buffered_reader), output[0])
    except Exception as e:
        print('Failed saving images to directory', e)
        print(output[0])

    return jsonify({"scary_image_url": output})


@app.route('/roasting', methods=['POST'])
def roast():
    data = request.json
    image_data = data['image'].split(',')[1]
    image = Image.open(BytesIO(base64.b64decode(image_data)))

    # Save the image to a file
    image_path = 'uploaded_image_roast.jpg'
    image.save(image_path)

    # Call the replicate API
    output = replicate.run(
        # "yorickvp/llava-13b:2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591",
        "yorickvp/llava-v1.6-vicuna-13b:0603dec596080fa084e26f0ae6d605fc5788ed2b1a0358cd25010619487eae63",
        input={
            "image": open(image_path, "rb"),
            "prompt": "Roast the people in this picture. Roasts should be short, hilarious, 20 words maximum. Roasts should be smart, creative, and extremely funny.\nOnly keep the roast part, no need to describe the scene.\n WE COUNT ON YOU!"
        }
    )

    # Concatenate the output to get the roast text
    roast_text = ""
    for item in output:
        roast_text += item

    print(roast_text)
    return jsonify({'roast_text': roast_text})


if __name__ == '__main__':
    app.run(debug=True)

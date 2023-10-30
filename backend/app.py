import requests
from flask import Flask, request, jsonify
import base64
from io import BytesIO
from PIL import Image
from flask_cors import CORS
import os
import replicate

app = Flask(__name__)
CORS(app, origins="http://localhost:3000")

DEST_EMAIL = 'test@gmail.com'
SENDER_EMAIL = 'test@gmail.com'
GMAIL_APP_TOKEN = 'YOUR_GMAIL_APP_TOKEN'
REPLICATE_API_TOKEN = 'YOUR_REPLCIATE_API_TOKEN'

os.environ['SENDER_EMAIL'] = SENDER_EMAIL
os.environ['GMAIL_APP_TOKEN'] = GMAIL_APP_TOKEN # https://www.getmailbird.com/gmail-app-password/
os.environ['REPLICATE_API_TOKEN'] = REPLICATE_API_TOKEN


def send_email(image_path: str, dest_email: str):
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.base import MIMEBase
    from email import encoders

    # Your Gmail account
    from_address = os.getenv("SENDER_EMAIL")
    password = os.getenv("GMAIL_APP_TOKEN") # follow this guide to create such a token for your Gmail account https://stackoverflow.com/questions/72480454/sending-email-with-python-google-disables-less-secure-apps

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
    mime_image.add_header("Content-Disposition", f"attachment; filename= {image_path}")
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
    data = request.get_json()
    imgUrl = data.get('imgUrl')
    if imgUrl:
        try:
            response = requests.get(imgUrl, stream=True)
            img_path = 'uploaded_image.jpg'
            with open(img_path, 'wb') as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
            send_email(img_path, DEST_EMAIL)
            return {'message': 'Image saved successfully'}, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    return {'error': 'No URL provided'}, 400    


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
        "yorickvp/llava-13b:2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591",
        input={
            "image": open(image_path, "rb"),
            "prompt": "Roast the people in this picture. Roasts should be short, 10 words maximum. Roasts should be smart, creative, and extremely funny.\nOnly keep the roast part, no need to describe the scene.\n WE COUNT ON YOU! "
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

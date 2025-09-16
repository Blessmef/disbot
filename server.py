from flask import Flask,jsonify,request

app = Flask(__name__)

@app.route('/')
def hello_world():
    args = request.args
    string = args.get("q")
    detection = False
    results = 0

    if (results > 0.05000000 and string != ""):
        detection = True

    data = {
        "results":str(results),
        "detection":detection,
    }

    return jsonify(data)

if __name__ == '__main__':
    app.run(port=5500)
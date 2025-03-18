from fastapi import FastAPI

import boto3
import cv2 as cv
import numpy as np
import gc
import json
import os

from PIL import Image
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = "us-east-1"


origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def change_pillow_cv2(image_file: Image) -> np.ndarray:
    # Pillow 画像を numpy 配列に変換
    image_2 = np.array(image_file, dtype=np.uint8)
    
    if image_2.ndim == 2:  # モノクロ画像
        pass
    elif image_2.shape[2] == 3:  # カラー画像
        image_2 = cv.cvtColor(image_2, cv.COLOR_RGB2BGR)
    elif image_2.shape[2] == 4:  # 透過画像 (RGBA)
        image_2 = cv.cvtColor(image_2, cv.COLOR_RGBA2BGRA)  # ここが修正ポイント
    
    return image_2

#akaze特徴を抽出
def akaze_(image_file: Image) -> np.ndarray:

    image_1 = change_pillow_cv2(image_file)
    akaze = cv.AKAZE_create()
    kp,des = akaze.detectAndCompute(image_1,None)

    del image_1
    del akaze
    del kp

    gc.collect()

    return des


@app.get("/getresult/{id}")
async def get_result(id: str):
    s3 = boto3.client('s3')
    fbucket = os.getenv('AWS_S3_BUCKET')
    bucket = os.getenv('AWS_S3_RESULTS_BUCKET')
    # prefix = 'r_CdP/'
    prefix = f"{id}/"
    json_files, json_data = [], []

    try:

        response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
        for obj in response.get('Contents', []):
            key = obj['Key']
            if key.endswith('.json'):
                json_files.append(key)

        for file_key in json_files:
            data = s3.get_object(Bucket=bucket, Key=file_key)
            content = data['Body'].read().decode('utf-8')
            json_data.append(json.loads(content))

        akaze_data = [{
            "Filename":data["Filename"],
            "Akaze":akaze_(Image.open(BytesIO(s3.get_object(Bucket=fbucket, Key=data["Filename"])["Body"].read())))
        } for data in json_data]

        for i in range(len(json_data)-1):
            for j in range(i+1,len(json_data)):
                akaze1 = akaze_data[i]["Akaze"]
                akaze2 = akaze_data[j]["Akaze"]
                bf = cv.BFMatcher(cv.NORM_HAMMING,crossCheck=True)
                matches = bf.match(akaze1,akaze2)
                distan = [m.distance for m in matches]
                ret = sum(distan) / len(distan)
                print(i, j, ret)
                json_data[i]["Score"] *= ret
                json_data[j]["Score"] *= ret

        return json_data
    
    
    except Exception as e:
        return {"error": str(e)}


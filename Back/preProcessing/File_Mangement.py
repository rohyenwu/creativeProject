import os
from fastapi import UploadFile
import shutil

# 현재 파일 위치: creativeProject/Back/preProcessing/File_Mangement.py
# BASE_DIR: creativeProject/Back
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ROOT_DIR: creativeProject/
ROOT_DIR = os.path.dirname(BASE_DIR)

# 디렉토리 경로 고정
PREC_SAVE_DIR = os.path.join(ROOT_DIR, "precsv")
CSV_SAVE_DIR = os.path.join(ROOT_DIR, "csv")


# -------------------------------
# ✅ Delete Functions (절대경로 사용)
# -------------------------------

def Delete_HospitalCSV():
    filepath = os.path.join(PREC_SAVE_DIR, "hospitalFacilities.csv")
    if os.path.exists(filepath):
        os.remove(filepath)
        return "hospitalFacilities.csv deleted"
    else:
        return "hospitalFacilities.csv not found"

def Delete_OutingCSV():
    filepath = os.path.join(PREC_SAVE_DIR, "outingFacilities.csv")
    if os.path.exists(filepath):
        os.remove(filepath)
        return "outingFacilities.csv deleted"
    else:
        return "outingFacilities.csv not found"

def Delete_PublicCSV():
    filepath = os.path.join(PREC_SAVE_DIR, "publicFacilities.csv")
    if os.path.exists(filepath):
        os.remove(filepath)
        return "publicFacilities.csv deleted"
    else:
        return "publicFacilities.csv not found"


# -------------------------------
# ✅ Upload Functions (절대경로 사용)
# -------------------------------

async def Upload_HospitalCSV(file: UploadFile):
    os.makedirs(PREC_SAVE_DIR, exist_ok=True)
    save_path = os.path.join(PREC_SAVE_DIR, "hospitalFacilities.csv")
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "hospitalFacilities.csv uploaded", "path": save_path}

async def Upload_PublicCSV(file: UploadFile):
    os.makedirs(PREC_SAVE_DIR, exist_ok=True)
    save_path = os.path.join(PREC_SAVE_DIR, "publicFacilities.csv")
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "publicFacilities.csv uploaded", "path": save_path}

async def Upload_OutingCSV(file: UploadFile):
    os.makedirs(PREC_SAVE_DIR, exist_ok=True)
    save_path = os.path.join(PREC_SAVE_DIR, "outingFacilities.csv")
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "outingFacilities.csv uploaded", "path": save_path}

async def Upload_LeisureCSV(file: UploadFile):
    os.makedirs(CSV_SAVE_DIR, exist_ok=True)
    save_path = os.path.join(CSV_SAVE_DIR, "leisureFacilities.csv")
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "leisureFacilities.csv uploaded", "path": save_path}


# -------------------------------
# ✅ Upload Multiple Files
# -------------------------------

async def Upload_Files(files):
    os.makedirs(PREC_SAVE_DIR, exist_ok=True)
    saved_files = []
    for file in files:
        file_location = os.path.join(PREC_SAVE_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_files.append(file_location)
    return {"file_paths": saved_files}

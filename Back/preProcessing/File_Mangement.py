import os
from fastapi import UploadFile, File
import shutil

def Delete_HospitalCSV():
    filepath = "../../precsv/hospitalFacilities.csv"
    if os.path.exists(filepath):
        os.remove(filepath)
        return "hospitalFacilities.csv deleted"
    else:
        return "hospitalFacilities.csv not found"
def Delete_OutingCSV():
    filepath = "../../precsv/outingFacilities.csv"
    if os.path.exists(filepath):
        os.remove(filepath)
        return "outingFacilities.csv deleted"
    else:
        return "outingFacilities.csv not found"
def Delete_PublicCSV():
    filepath = "../../precsv/publicFacilities.csv"
    if os.path.exists(filepath):
        os.remove(filepath)
        return "publicFacilities.csv deleted"
    else:
        return "publicFacilities.csv not found"
    
async def Upload_HospitalCSV(file):
    save_path = "../../precsv/hospitalFacilities.csv"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "hospitalFacilities.csv uploaded", "path": save_path}

async def Upload_PublicCSV(file):
    save_path = "../../precsv/publicFacilities.csv"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "publicFacilities.csv uploaded", "path": save_path}
async def Upload_OutingCSV(file):
    save_path = "../../precsv/outingFacilities.csv"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "outingFacilities.csv uploaded", "path": save_path}
async def Upload_LeisureCSV(file):
    save_path = "../../csv/leisureFacilities.csv"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "leisureFacilities.csv uploaded", "path": save_path}
async def Upload_Files(files):
    saved_files = []
    for file in files:
        file_location = f"../../precsv/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_files.append(file_location)
    return {"file_paths": saved_files}
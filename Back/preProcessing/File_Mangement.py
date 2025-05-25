import os
from fastapi import UploadFile, File
import shutil

def Delete_PreCSVFiles():
    filepath="../precsv"
    if os.path.exists(filepath):
        for file in os.scandir(filepath):
                os.remove(file.path)
        return "Remove ALL File"
    else: return 'Directory Not Found'
async def Upload_Files(files):
    saved_files = []
    for file in files:
        file_location = f"../precsv/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_files.append(file_location)
    return {"file_paths": saved_files}
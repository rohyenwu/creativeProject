import Back.Model.DBConnection as DBConnection
import aiomysql
import Back.preProcessing.File_Mangement as fm
import Back.preProcessing.inputDB as inDB
import Back.preProcessing.dataPreProcess as pre
import Model.adminModel as admin
class adminService:
    @staticmethod
    def DB_Update(files):
         fm.Delete_PreCSVFiles()
         fm.UploadFile(files)
                 
         
         
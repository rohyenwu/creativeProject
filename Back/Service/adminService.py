import Back.Model.DBConnection as DBConnection
import aiomysql
import Back.preProcessing.File_Mangement as fm
import Back.preProcessing.inputDB as inDB
import Back.preProcessing.dataPreProcess as pre
import Model.adminModel as admin
import Back.preProcessing.sync as sync
class adminService:
    @staticmethod
    def DB_Update(public, outing, leisure, hospital):
        if(public!=None):
            fm.Delete_PublicCSV()
            fm.Upload_PublicCSV()
            pre.clean_public_facilities()
            sync.sync_public_table("csv/publicFacilities.csv")
        if(outing!=None):
            fm.Delete_OutingCSV()
            fm.Upload_OutingCSV()
            pre.clean_outing_facilities()
            sync.sync_outing_table("csv/outingFacilities.csv")
        if(leisure!=None):
            fm.Upload_LeisureCSV()
            sync.sync_leisure_table("csv/leiusreFacilities.csv")
        if(hospital!=None):
         fm.Delete_HospitalCSV()
         fm.Upload_HospitalCSV()
         pre.clean_hospital_facilities()
         sync.sync_hospital_table("csv/hospitalFacilities.csv")

                 
         
         
import Back.Model.DBConnection as DBConnection
import aiomysql
import Back.preProcessing.File_Mangement as fm
import Back.preProcessing.inputDB as inDB
import Back.preProcessing.dataPreProcess as pre
import Model.adminModel as admin
import Back.preProcessing.sync as sync
#한번에 다 받도록
class adminService:
    @staticmethod
    async def DB_Update(public, outing, leisure, hospital):
        if(public!=None):
            fm.Delete_PublicCSV()
            await fm.Upload_PublicCSV(public)
            pre.clean_public_facilities()
            sync.sync_public_table("csv/publicFacilities.csv")
        if(outing!=None):
            fm.Delete_OutingCSV()
            await fm.Upload_OutingCSV(outing)
            pre.clean_outing_facilities()
            sync.sync_outing_table("csv/outingFacilities.csv")
        if(leisure!=None):
            await fm.Upload_LeisureCSV(leisure)
            sync.sync_leisure_table("csv/leisureFacilities.csv")
        if(hospital!=None):
            fm.Delete_HospitalCSV()
            await fm.Upload_HospitalCSV(hospital)
            pre.clean_hospital_facilities()
            sync.sync_hospital_table("csv/hospitalFacilities.csv")

                    
         
         
; Custom NSIS installer script for TextilePOS
; Checks if MongoDB is installed before completing setup

!macro customInstall
  ; Check if MongoDB service exists
  nsExec::ExecToStack 'sc query MongoDB'
  Pop $0
  Pop $1
  ${If} $0 != 0
    MessageBox MB_YESNO|MB_ICONINFORMATION \
      "TextilePOS requires MongoDB to store data.$\n$\nMongoDB does not appear to be installed or running.$\n$\nWould you like to open the MongoDB download page?" \
      IDYES openMongo IDNO skipMongo
    openMongo:
      ExecShell "open" "https://www.mongodb.com/try/download/community"
    skipMongo:
  ${EndIf}
!macroend

!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Do you want to delete all TextilePOS data and backups?$\n$\nClick NO to keep your data." \
    IDYES deleteData IDNO skipDelete
  deleteData:
    RMDir /r "$APPDATA\TextilePOS"
  skipDelete:
!macroend

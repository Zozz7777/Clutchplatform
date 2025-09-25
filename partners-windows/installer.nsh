; Custom NSIS installer script for Clutch Partners System

!macro preInit
  ; Check if the app is already running
  System::Call 'kernel32::CreateMutex(i 0, i 0, t "ClutchPartnersSystem") i .r1 ?e'
  Pop $R0
  StrCmp $R0 0 +3
    MessageBox MB_OK|MB_ICONEXCLAMATION "Clutch Partners System is already running. Please close it before installing."
    Abort
!macroend

!macro customInstall
  ; Create application data directory
  CreateDirectory "$APPDATA\ClutchPartners"
  
  ; Set up database migration
  DetailPrint "Setting up database..."
  ExecWait '"$INSTDIR\Clutch Partners System.exe" --setup-database'
  
  ; Register file associations
  WriteRegStr HKCR ".clutch-partner" "" "ClutchPartners.Document"
  WriteRegStr HKCR "ClutchPartners.Document" "" "Clutch Partners Document"
  WriteRegStr HKCR "ClutchPartners.Document\DefaultIcon" "" "$INSTDIR\Clutch Partners System.exe,0"
  WriteRegStr HKCR "ClutchPartners.Document\shell\open\command" "" '"$INSTDIR\Clutch Partners System.exe" "%1"'
  
  ; Add to Windows Firewall exceptions
  DetailPrint "Configuring Windows Firewall..."
  ExecWait 'netsh advfirewall firewall add rule name="Clutch Partners System" dir=in action=allow program="$INSTDIR\Clutch Partners System.exe"'
  
  ; Create uninstaller registry entry
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem" "DisplayName" "Clutch Partners System"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem" "UninstallString" '"$INSTDIR\Uninstall Clutch Partners System.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem" "DisplayIcon" "$INSTDIR\Clutch Partners System.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem" "Publisher" "Clutch Platform"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem" "DisplayVersion" "1.0.0"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem" "NoRepair" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem" "EstimatedSize" 500000
!macroend

!macro customUnInstall
  ; Remove from Windows Firewall
  ExecWait 'netsh advfirewall firewall delete rule name="Clutch Partners System"'
  
  ; Remove file associations
  DeleteRegKey HKCR ".clutch-partner"
  DeleteRegKey HKCR "ClutchPartners.Document"
  
  ; Remove uninstaller registry entry
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClutchPartnersSystem"
  
  ; Ask user if they want to keep application data
  MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to keep your application data (settings, database, etc.)?" IDYES keep_data
  RMDir /r "$APPDATA\ClutchPartners"
  keep_data:
!macroend

!macro customHeader
  ; Custom header text
  !define MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE_BITMAP "assets\icons\installer-header.bmp"
  !define MUI_HEADERIMAGE_UNBITMAP "assets\icons\installer-header.bmp"
!macroend

!macro customWelcomePage
  ; Custom welcome page
  !define MUI_WELCOMEPAGE_TITLE "Welcome to Clutch Partners System"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of Clutch Partners System.$\r$\n$\r$\nClutch Partners System is a production-ready desktop POS and Inventory Management application designed for auto parts shops, repair centers, and accessories shops.$\r$\n$\r$\nClick Next to continue."
!macroend

!macro customFinishPage
  ; Custom finish page
  !define MUI_FINISHPAGE_TITLE "Installation Complete"
  !define MUI_FINISHPAGE_TEXT "Clutch Partners System has been successfully installed on your computer.$\r$\n$\r$\nThe application is now ready to use. You can start it from the desktop shortcut or from the Start menu."
  !define MUI_FINISHPAGE_RUN "$INSTDIR\Clutch Partners System.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "Launch Clutch Partners System"
  !define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\README.txt"
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "View README"
!macroend

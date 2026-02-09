; Inno Setup Script Compiler
; Téléchargez Inno Setup: https://jrsoftware.org/isinfo.php

[Setup]
AppName=Gestion RV Médicaux
AppVersion=1.0.0
AppPublisher=GestionRV
AppPublisherURL=https://github.com
AppSupportURL=https://github.com
AppUpdatesURL=https://github.com
DefaultDirName={pf}\GestionRV
DefaultGroupName=Gestion RV Médicaux
AllowNoIcons=yes
OutputDir=.\dist
OutputBaseFilename=GestionRV-Setup-1.0.0
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
WizardStyle=modern

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "Créer un raccourci sur le Bureau"; GroupDescription: "Options supplémentaires:"; Flags: unchecked

[Files]
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Dirs]
Name: "{app}"

[Icons]
Name: "{group}\Gestion RV Médicaux"; Filename: "{app}\launch.bat"; WorkingDir: "{app}"
Name: "{group}\Désinstaller"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Gestion RV Médicaux"; Filename: "{app}\launch.bat"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\setup.ps1"""; Flags: shellexec waituntilterminated; Description: "Installation des dépendances"
Filename: "{app}\launch.bat"; Flags: shellexec; Description: "Lancer l'application"; StatusMsg: "Démarrage de l'application..."

[UninstallDelete]
Type: dirifempty; Name: "{app}"

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    MsgBox('Gestion RV Médicaux a été installée avec succès!' + #13#13 +
           'Un raccourci a été créé dans le menu Démarrer.' + #13 +
           'Cliquez sur "Gestion RV Médicaux" pour lancer l''application.',
           mbInformation, MB_OK);
  end;
end;

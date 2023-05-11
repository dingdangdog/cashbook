[Setup]
AppName=Cashbook
AppVersion=1.0
DefaultDirName={autopf}\Cashbook
DefaultGroupName=oldmoon
Uninstallable=true

[Dirs]
Name: "{app}\data"

[Files]
Source: "source\server\target\cashbook-server-1.0.jar"; DestDir: "{app}"; Flags: "jar file"
Source: "source\cashbook.png"; DestDir: "{app}"; Flags: "icon file"

[Icons]
Name: "{group}\cashbook"; Filename: "{app}\cashbook.exe"; WorkingDir: "{app}"; IconFilename: "{app}\cashbook.png"

[Languages]
Name: "zh"; MessagesFile: "compoler:Languages\ChineseSimplified.isl"
Name: "en"; MessagesFile: "compiler:Default.isl"
set Pathname="C:\Users\Nouvel Utilisateur\Desktop\cours node js\bibliotheque\data"

cd /d "D:\Logiciels\MongoDB\Server\3.2\bin"
start cmd.exe /k "mongod --dbpath %Pathname%"
start cmd.exe /k "mongo"
ping 127.0.0.1 -n 1 > nul
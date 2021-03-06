
param(
    [switch]$log,
    [switch]$discover,
    [switch]$parallel,
    
    [string]$filter = ""
)

Write-Host "Building tests."
npm run test

Write-Host "Killing node process.`n"
Stop-Process -Force -Name "node" -ErrorAction SilentlyContinue

$ProjectDir = (Get-Item ([System.IO.Path]::GetDirectoryName($myInvocation.MyCommand.Definition))).Parent.FullName
$testFolder = Join-Path $ProjectDir "test\JSTestHost.UnitTests\bin\test"
$tests = Get-ChildItem -Path $testFolder -Recurse -Filter "*.js"

$command = "D:\vstest\artifacts\Debug\net451\win7-x64\vstest.console.exe --framework:javascript.mocha"
if($log) {
    $command = "$command --diag:D:\logs\jstest.log"
}
if($discover) {
    $command = "$command --listtests"
}
if($parallel) {
    $command = "$command --parallel"
}


Write-Host "Test files:"

if($filter -eq "") {
    $filter = "*"
}
else {
    $filter = "*$filter*"
}

foreach($path in $tests) {
    if("$($path.FullName)" -like $filter) {
        Write-Host "$path"
        $command = $($command + " `"$($path.FullName)`"")
    }
}

Write-Host "--------------------------------------------------------------------"
Write-Host $command;
Write-Host "--------------------------------------------------------------------"

iex $command
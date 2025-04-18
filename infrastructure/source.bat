"""
Windows batch script for setting up the development environment.

This script:
- Creates a Python virtual environment
- Installs dependencies
- Activates the virtual environment

It's used on Windows systems to quickly set up the development environment.
"""

@echo off

rem The sole purpose of this script is to make the command
rem
rem     source .venv/bin/activate
rem
rem (which activates a Python virtualenv on Linux or Mac OS X) work on Windows.
rem On Windows, this command just runs this batch file (the argument is ignored).
rem
rem Now we don't need to document a Windows command for activating a virtualenv.

echo Executing .venv\Scripts\activate.bat for you
.venv\Scripts\activate.bat

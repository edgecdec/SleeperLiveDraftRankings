#!/bin/bash

# Change to the directory where this script is located
cd "$(dirname "$0")"

# Run the actual dependency checker
./check_dependencies.sh

# Keep terminal open so user can see results
echo ""
echo "Press any key to close this window..."
read -n 1
#!/usr/bin/env python3
"""
Simple script to build executable for distribution
"""

import subprocess
import sys
from pathlib import Path

def main():
    print("🏈 Building Fantasy Draft Assistant Executable")
    print("=" * 50)
    
    # Check if build script exists
    build_script = Path('build_for_distribution.py')
    if not build_script.exists():
        print("❌ Build script not found")
        return
    
    # Run the build
    try:
        subprocess.run([sys.executable, 'build_for_distribution.py'], check=True)
    except subprocess.CalledProcessError:
        print("❌ Build failed")
        return
    except KeyboardInterrupt:
        print("\\n❌ Build cancelled")
        return
    
    print("\\n🎉 Build complete!")
    print("📁 Check the 'dist' folder for your executable")

if __name__ == "__main__":
    main()

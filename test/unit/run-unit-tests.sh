#!/bin/bash
# Script to run only unit tests (fast, isolated)

echo "Running Unit Tests..."
echo "===================="

bun test test/unit/

echo ""
echo "Unit tests completed!"

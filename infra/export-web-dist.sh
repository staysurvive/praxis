#!/bin/sh
set -eu

releases_dir=/output/releases
next_link=/output/.next-current
current_link=/output/current

mkdir -p "$releases_dir"
chmod 755 "$releases_dir"
stage_dir=$(mktemp -d "$releases_dir/.staging.XXXXXX")
cp -R /site/. "$stage_dir/"
chmod -R a+rX "$stage_dir"
chmod 755 "$stage_dir"
rm -f "$next_link"
ln -s "releases/$(basename "$stage_dir")" "$next_link"
mv -Tf "$next_link" "$current_link"

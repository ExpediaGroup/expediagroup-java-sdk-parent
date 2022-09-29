function updatePomContent() {
  git checkout -b "$branchName"
  version=$(node ./index.js)
  git add ../bom/pom.xml
  git commit -m "upgrade bom version to $version"
  git checkout main
  git merge "$branchName" || git merge --abort
}

function retryMerge() {
  echo "We are facing conflicts and trying to solve it"
  git checkout "$branchName"
  git branch -D main
  git pull
  git checkout main
  git branch -D "$branchName"
  updatePomContent
}
git config --global user.name 'eg-oss-ci'
git config --global user.email 'oss@expediagroup.com'
updatePomContent
allGood=false
while true; do
  git push origin main && allGood=true || retryMerge
  if $allGood; then
    break
  fi
done

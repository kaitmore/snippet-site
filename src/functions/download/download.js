const { Octokit } = require("@octokit/rest");
const fetch = require("node-fetch");
/* eslint-disable */
const config = {
  owner: process.env.GH_OWNER || "kaitmore",
  repo: process.env.GH_REPO || "copypasta",
  token: process.env.GH_TOKEN
};
const fs = require("fs");

exports.handler = async function (event, context) {
  const { owner, repo, token } = config;
  const github = new Octokit({ auth: token });

  const { data: releases } = await github.repos.listReleases({
    owner,
    repo
  });
  const latestRelease = releases.shift();

  let asset_id;
  try {
    asset_id = latestRelease.assets.find((a) => a.name.endsWith(".dmg")).id;
  } catch (e) {
    console.error("Could not find the latest release asset");
    process.exit(1);
  }

  // let download_url = asset.browser_download_url;

  const asset = await github.repos.getReleaseAsset({
    owner,
    repo,
    asset_id,
    headers: {
      Accept: "application/octet-stream",
      authorization: `token ${token}`
    }
  });
  fs.readdir(".", (err, files) => {
    files.forEach((file) => {
      console.log(file);
    });
  });
  console.log(asset);
  return {
    statusCode: 200,
    body: asset
  };

  // let asset_id;
  // try {
  //   asset_id = latestRelease.assets.find((a) => a.name.endsWith(".dmg")).id;
  // } catch (e) {
  //   console.error("Could not find the latest release asset");
  //   process.exit(1);
  // }
  // console.log(latestRelease.assets);
  // const asset = await github.repos.getReleaseAsset({
  //   owner,
  //   repo,
  //   asset_id
  // });

  // console.log("asset", asset);
};

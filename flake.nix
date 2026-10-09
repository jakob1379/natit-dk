{
  description = "natit.dk – alumni site for Naturvidenskab og IT (KU)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages.teable-mcp = pkgs.buildNpmPackage {
          pname = "teable-mcp-server";
          version = "1.0.0-unstable-2026-06-07";
          src = pkgs.fetchFromGitHub {
            owner = "ltphat2204";
            repo = "teable-mcp-server";
            rev = "93fc3680611a1ec4435c4afc004a1d4651967701";
            hash = "sha256-tVI3Q8PaDXCeJVM0/Jss2OAfQeYr7jHurBV3KZbSFHs=";
          };
          npmDepsHash = "sha256-huZ8xM43mwjjK682HqHkYg2gVwZk/4dMb60jieF6AAQ=";
          meta.mainProgram = "teable-mcp-server";
        };

        devShells.default = pkgs.mkShell {
          packages = [ pkgs.wrangler ];
        };

        apps.deploy = {
          type = "app";
          program = toString (
            pkgs.writeShellScript "deploy" ''
              exec ${pkgs.wrangler}/bin/wrangler pages deploy ./site --project-name natit-dk "$@"
            ''
          );
        };

        apps.dev = {
          type = "app";
          program = toString (
            pkgs.writeShellScript "dev" ''
              exec ${pkgs.wrangler}/bin/wrangler pages dev ./site "$@"
            ''
          );
        };
      }
    );
}

{
  description = "natit.dk – alumni site for Naturvidenskab og IT (KU)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages.teable-cli = pkgs.stdenvNoCC.mkDerivation rec {
          pname = "teable-cli";
          version = "0.6.45";
          src = pkgs.fetchurl {
            url = "https://registry.npmjs.org/@teable/cli/-/cli-${version}.tgz";
            hash = "sha512-GrVMTVEH9xpU7mVAVcuBYhZEKWY0MNaMp2DUlqgQeDhOIzK7oqBnRvj8nIT37KVxy5wJ6/v7uzVdtdjz4d0icw==";
          };
          nativeBuildInputs = [ pkgs.makeWrapper ];
          installPhase = ''
            mkdir -p $out/lib/teable-cli
            cp -r bin dist package.json $out/lib/teable-cli
            makeWrapper ${pkgs.nodejs}/bin/node $out/bin/teable --add-flags $out/lib/teable-cli/bin/teable.js
          '';
          meta.mainProgram = "teable";
        };

        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.wrangler
            self.packages.${system}.teable-cli
          ];
          shellHook = ''
            if [ -f .env ]; then set -a; . ./.env; set +a; fi
          '';
        };

        apps.deploy = {
          type = "app";
          program = toString (
            pkgs.writeShellScript "deploy" ''
              exec ${pkgs.wrangler}/bin/wrangler deploy "$@"
            ''
          );
        };

        apps.dev = {
          type = "app";
          program = toString (
            pkgs.writeShellScript "dev" ''
              exec ${pkgs.wrangler}/bin/wrangler dev "$@"
            ''
          );
        };
      }
    );
}

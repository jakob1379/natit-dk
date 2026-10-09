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

{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.libpoppler
    pkgs.libpoppler_cpp
    pkgs.tesseract
    pkgs.imagemagick
  ];
  env = {
    PYTHONUNBUFFERED = "1";
    REPLIT_NIXES = "python311";
  };
}

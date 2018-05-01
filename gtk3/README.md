# gtk3

Just horsin' around with GTK+ 3 in C.

Initially this code will be based on GNOME's [GTK Getting Started](https://developer.gnome.org/gtk3/stable/gtk-getting-started.html) guide.

Building these files with `gcc` is easy:

```bash
gcc `pkg-config --cflags gtk+-3.0` -o example-0 example-0.c `pkg-config --libs gtk+-3.0`
```

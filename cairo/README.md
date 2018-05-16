# cairo

Just horsin' around with Cairo in C.

I'm starting from the [Wikipedia code example](https://en.wikipedia.org/wiki/Cairo_%28graphics%29#Example) and expanding from there.

Building these files with `gcc` is easy:

```bash
gcc `pkg-config --cflags cairo` -o hello hello.c `pkg-config --libs cairo`
```

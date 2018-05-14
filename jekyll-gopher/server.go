package main

import (
	"io/ioutil"
	"log"

	"github.com/prologic/go-gopher"
)

func index(w gopher.ResponseWriter, r *gopher.Request) {
	w.WriteItem(&gopher.Item{
		Type:        gopher.DIRECTORY,
		Selector:    "/hello",
		Description: "hello",
	})

	// TODO: include pages by looking for front matter
	files, err := ioutil.ReadDir("./_posts")
	if err != nil {
		log.Fatal(err)
	}

	for _, f := range files {
		// TODO: remove .md extension
		w.WriteItem(&gopher.Item{
			Type:        gopher.DOC,
			Selector:    "/posts/" + f.Name(),
			Description: f.Name(),
		})
	}
}

func hello(w gopher.ResponseWriter, r *gopher.Request) {
	w.WriteInfo("Hello World!")
}

func main() {
	gopher.HandleFunc("/", index)
	gopher.HandleFunc("/hello", hello)
	// TODO: support accessing post files
	log.Fatal(gopher.ListenAndServe("localhost:7070", nil))
}

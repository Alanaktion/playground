package main

import (
	"bufio"
	"flag"
	"fmt"
	"net"
	"os"
	"strings"
)

var root string
var host string
var port int
var listen string

func main() {
	// Get CLI flags
	flag.StringVar(&root, "root", "./", "Root directory of Jekyll blog")
	flag.StringVar(&host, "host", "localhost", "Public hostname for resources")
	flag.IntVar(&port, "port", 70, "Public port number")
	flag.StringVar(&listen, "listen", "localhost:70", "Host and port to listen on")

	flag.Parse()

	// Listen for incoming connections.
	l, err := net.Listen("tcp", listen)
	if err != nil {
		fmt.Println("Error listening:", err.Error())
		os.Exit(1)
	}

	// Close the listener when the application closes.
	defer l.Close()

	fmt.Println("Listening on " + listen)

	for {
		// Listen for an incoming connection.
		conn, err := l.Accept()
		if err != nil {
			fmt.Println("Error accepting: ", err.Error())
			os.Exit(1)
		}

		// Handle connections in a new goroutine.
		go handleConnection(conn)
	}
}

// Handles incoming connections.
func handleConnection(conn net.Conn) {
	reader := bufio.NewReader(conn)
	for {
		message, err := reader.ReadString('\n')
		if err != nil {
			conn.Close()
			return
		}
		handleMessage(conn, message)
	}
}

// Handles client messages.
func handleMessage(conn net.Conn, message string) {
	message = strings.TrimRight(message, "\r\n")
	if message == "" || message == "/" {
		// 1 Index menu
		conn.Write([]byte("iJekyll Blog\r\n"))
		writeMenuItem(conn, 1, "Posts", "/posts")
		writeMenuItem(conn, 0, "About the server", "/server")
	} else if message == "/posts" {
		// 1 Post menu
		// TODO: read _posts directory and populate menu
		writeMenuItem(conn, 0, "Example Post", "/posts/example-post")
	} else if message == "/server" {
		// 0 About
		conn.Write([]byte("About this server\r\n"))
		conn.Write([]byte("This will be implemeted later.\r\n"))
	} else {
		println("Bad request:" + message)
	}
	conn.Close()
}

// Write an item to an index.
func writeMenuItem(conn net.Conn, itemType int, display string, selector string) {
	s := fmt.Sprintf("%d%s\t%s\t%s\t%d\r\n", itemType, display, selector, host, port)
	conn.Write([]byte(s))
}

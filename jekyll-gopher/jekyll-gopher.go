package main

import (
	"bufio"
	"flag"
	"fmt"
	"net"
	"os"
	"regexp"
	"strings"
)

var root string
var host string
var port string
var listen string

func main() {
	// Get CLI flags
	flag.StringVar(&root, "root", "./", "Root directory of Jekyll blog")
	flag.StringVar(&host, "host", "localhost", "Public hostname for resources")
	flag.StringVar(&listen, "listen", "localhost:70", "Host and port to listen on")

	flag.Parse()
	r, _ := regexp.Compile("[0-9]+$")
	port = r.FindString(listen)

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
		// 1 Index
		conn.Write([]byte("iJekyll Blog\r\n"))
		conn.Write([]byte(fmt.Sprintf("0About the server\t/server\t%s\t%s\r\n", host, port)))
	} else if message == "/server" {
		// 0 About
		conn.Write([]byte("About this server\r\n"))
		conn.Write([]byte("This will be implemeted later.\r\n"))
	} else {
		println("Bad request:" + message)
	}
	conn.Close()
}

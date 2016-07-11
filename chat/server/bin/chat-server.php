#!/usr/bin/php
<?php
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Chat\Server;

chdir(__DIR__);
require dirname(__DIR__) . '/vendor/autoload.php';

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
  		  new Server()
  		)
  	),
    8080
);

$server->run();

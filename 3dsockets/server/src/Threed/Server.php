<?php
namespace Threed;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Server implements MessageComponentInterface {
	protected $clients, $nicks = [];

	public function __construct() {
		$this->clients = new \SplObjectStorage;
	}

	public function onOpen(ConnectionInterface $conn) {
		$this->clients->attach($conn);
		echo "Client {$conn->resourceId} connected\n";
	}

	public function onMessage(ConnectionInterface $from, $msg) {
		echo $msg, "\n";
		foreach ($this->clients as $client) {
			if($client != $from) {
				$client->send($msg);
			}
		}
	}

	public function onClose(ConnectionInterface $conn) {
		$this->clients->detach($conn);
		echo "Client {$conn->resourceId} disconnected\n";
	}

	public function onError(ConnectionInterface $conn, \Exception $e) {
		echo "An error has occurred: {$e->getMessage()}\n";
		$conn->close();
	}
}

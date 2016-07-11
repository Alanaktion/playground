<?php
namespace Chat;
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
		$obj = json_decode($msg);
		switch($obj->type) {
			case 'message':
				$nick = @$this->nicks[$from->resourceId] ?: $from->resourceId;
				echo sprintf('Client %d [%s]: %s' . "\n", $from->resourceId,
					$nick, $obj->message);

				$m = json_encode([
					"type" => "message",
					"clientId" => $from->resourceId,
					"nick" => $nick,
					"message" => $obj->message,
				]);
				break;
			case 'nick':
				$oldnick = @$this->nicks[$from->resourceId];
				echo sprintf('Client %d [%s] set nick to: %s' . "\n",
					$from->resourceId, $oldnick, $obj->nick);
				$this->nicks[$from->resourceId] = $obj->nick;
				if($oldnick !== null) {
					$m = json_encode([
						"type" => "nick",
						"clientId" => $from->resourceId,
						"nick" => $obj->nick,
						"oldnick" => $oldnick,
					]);
				} else {
					$m = json_encode([
						"type" => "join",
						"clientId" => $from->resourceId,
						"nick" => $obj->nick,
					]);
				}
				break;
		}

		// Send message, if any
		if(isset($m)) {
			foreach ($this->clients as $client) {
				$client->send($m);
			}
		}
	}

	public function onClose(ConnectionInterface $conn) {
		$this->clients->detach($conn);

		$m = json_encode([
			"type" => "part",
			"clientId" => $conn->resourceId,
			"nick" => @$this->nicks[$conn->resourceId]
		]);
		foreach ($this->clients as $client) {
			$client->send($m);
		}

		echo "Client {$conn->resourceId} disconnected\n";
	}

	public function onError(ConnectionInterface $conn, \Exception $e) {
		echo "An error has occurred: {$e->getMessage()}\n";
		$conn->close();
	}
}

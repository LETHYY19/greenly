// -----------------------------------------------------------------------
// Definições de Hardware
// -----------------------------------------------------------------------
const LED_POWER  = 2;
const PUMP       = 25;
const COOLER     = 26;
const SNSR_DHT11 = 27;
const SNSR_SOLO  = 35;
const SNSR_LDR   = 34;

// -----------------------------------------------------------------------
// Configuração do Wi-Fi
// -----------------------------------------------------------------------
const WIFI_SSID = "WIFI_IOT2"
const WIFI_PASS = "WIFI_IOT2"

// -----------------------------------------------------------------------
// Configuração do MQTT
// -----------------------------------------------------------------------
const MQTT_BROKER = "10.189.87.230";
const MQTT_PORT = 1883;
const MQTT_CLIENT_ID = "ESP32_ESTUFA";
const MQTT_TEMPERATURE_TOPIC = "estufa/temp";
const MQTT_HUMIDITY_AIR_TOPIC = "estufa/umid_ar";
const MQTT_HUMIDITY_GROUND_TOPIC = "estufa/umid_solo";
const MQTT_LIGHT_TOPIC = "estufa/luz";

// -----------------------------------------------------------------------
// Configuração do Hardware
// -----------------------------------------------------------------------
pinMode(PUMP,   "output");
pinMode(COOLER, "output");

digitalWrite(PUMP, 1);
digitalWrite(COOLER, 1);

pinMode(SNSR_SOLO, "input");
pinMode(SNSR_LDR,  "input");

pinMode(LED_POWER, "output");

// -----------------------------------------------------------------------
// Inicialização do Wi-Fi e MQTT
// -----------------------------------------------------------------------
let wifi = require("Wifi");
let mqtt = require("MQTT").create(MQTT_BROKER, {port: MQTT_PORT, client_id: MQTT_CLIENT_ID});

wifi.connect(WIFI_SSID, {password: WIFI_PASS});

wifi.on("connected", function()
{
	console.log("ESP32 Conectado");
	console.log("Conectando ao Broker MQTT...\n")
	mqtt.connect();
});

wifi.on("disconnected", function()
{
	console.log("ESP32 Desconectado");
	console.log("Reconectando ao Wi-Fi...\n");
	wifi.connect(WIFI_SSID, {password: WIFI_PASS});
});

mqtt.on("connected", function()
{
	console.log("MQTT Conectado");
});

mqtt.on("disconnected", function()
{
	console.log("MQTT Desconectado");
	console.log("Reconectando ao Broker...\n");
	mqtt.connect();
});

// -----------------------------------------------------------------------
// Inicializando o Funcionamento da LED (Power On)
// -----------------------------------------------------------------------
setInterval(function()
{
	digitalWrite(LED_POWER, !digitalRead(LED_POWER));
}, 1000);

// -----------------------------------------------------------------------
// Inicializando o Funcionamento da Bomba
// -----------------------------------------------------------------------
setInterval(function()
{
	digitalWrite(PUMP, 0);

	setTimeout(function()
	{
		digitalWrite(PUMP, 1);
	}, 1000);
}, 30000);

// -----------------------------------------------------------------------
// Inicializando o Funcionamento do Cooler
// -----------------------------------------------------------------------
setInterval(function()
{
	digitalWrite(COOLER, !digitalRead(COOLER));
}, 30000);

// -----------------------------------------------------------------------
// Inicializando do DHT11
// -----------------------------------------------------------------------
let dht = require("dht11.js").connect(SNSR_DHT11);

// -----------------------------------------------------------------------
// Leitura Periodica dos Sensores e Postando os Dados via MQTT
// -----------------------------------------------------------------------
setInterval(function()
{
	let temp = dht.readTemperature();
	let umid_ar = dht.readHumidity();
	let umid_solo = analogRead(SNSR_SOLO) * 100 | 0;
	let luz = analogRead(SNSR_LDR) * 100 | 0;

	console.log("Temp.:      " + temp      + " .C");
	console.log("Umid. Ar:   " + umid_ar   + "%"  );
	console.log("Umid. Solo: " + umid_solo + "%"  );
	console.log("Luz:        " + luz       + "%"  );
	console.log("");

	mqtt.publish(MQTT_TEMPERATURE_TOPIC,     String(temp));
	mqtt.publish(MQTT_HUMIDITY_AIR_TOPIC,    String(umid_ar));
	mqtt.publish(MQTT_HUMIDITY_GROUND_TOPIC, String(umid_solo));
	mqtt.publish(MQTT_LIGHT_TOPIC, 			 String(luz));
}, 5000);

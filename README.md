## Gereksinimler

- Node.js 22 veya üzeri (Node.js 24 LTS önerilir)
- npm
- `cds watch` komutunu doğrudan kullanmak için isteğe bağlı global `@sap/cds-dk`

## Kurulum

```sh
npm install
```

## Çalıştırma

Geliştirme sunucusunu dosya değişikliklerini izleyerek başlatın:

```sh
npm run watch
```

Global CDS Development Kit kuruluysa aynı işlem doğrudan çalıştırılabilir:

```sh
cds watch
```

Standart sunucu başlangıcı için:

```sh
npm start
```

Uygulama varsayılan olarak <http://localhost:4004> adresinde açılır. Ana sayfa kullanılabilir servisleri ve OData metadata bağlantılarını listeler.

## Servisler

- `GET /browse/Books`: Salt-okunur kitap kataloğu; yazar ve tür adları düzleştirilmiş olarak döner. Stoku 111'in üzerindeki kitap başlıklarına `%11 discount` bilgisi eklenir.
- `POST /browse/submitOrder`: Basic Authentication ile `{ "book": 201, "quantity": 2 }` gövdesi gönderildiğinde stoktan sipariş miktarını atomik olarak düşürür.
- `/admin/Books`: Kitap yönetimi için CRUD servisi.
- `/admin/Authors`: Yazar yönetimi; `?$expand=books` ile yazarın kitapları sorgulanabilir.
- `/admin/Genres`: Hiyerarşik tür yönetimi.
- `/admin/$metadata` ve `/browse/$metadata`: OData V4 servis tanımları.

Örnek sorgular:

```text
http://localhost:4004/browse/Books?$select=ID,title,author,genre,stock
http://localhost:4004/admin/Authors?$select=ID,name&$expand=books($select=ID,title)
```

## Testler

```sh
npm test
```

Testler gerçek bir CAP test sunucusu başlatarak katalog sorgusunu, entity ilişkilerini, sipariş sonrası stok değişimini ve doğrulama hatalarını kontrol eder.

## Proje Yapısı

```text
bookshop/
├── app/                 # İsteğe bağlı kullanıcı arayüzleri
├── db/
│   ├── schema.cds       # Books, Authors ve Genres veri modeli
│   └── data/            # CSV başlangıç verileri
├── srv/
│   ├── admin-service.cds
│   ├── admin-constraints.cds
│   ├── cat-service.cds
│   └── cat-service.js   # Sipariş handler'ı
├── test/                # HTTP entegrasyon testleri
├── package.json
└── README.md
```

`node-ogrenme/` kişisel Node.js alıştırmalarını içerir ve Bookshop uygulamasının parçası değildir.

Model ve servis yaklaşımı SAP'nin resmi [CAP Bookshop öğreticisini](https://cap.cloud.sap/docs/get-started/bookshop) temel alır.

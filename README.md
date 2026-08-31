# SAP CAP Bookshop

SAP CAP/CDS 10 ve SQLite kullanan kitap yönetimi uygulamasıdır. Backend servisleri ile Vanilla HTML, CSS ve JavaScript tabanlı CRUD arayüzü aynı yerel CAP sunucusunda çalışır.

## Gereksinimler

- Node.js 22 veya 
- npm

Global `@sap/cds-dk` kurulumu gerekli değildir; proje komutları yerel npm bağımlılıklarını kullanır.

## İlk Kurulum

Bağımlılıkları kurun, kalıcı SQLite veritabanını mevcut CDS şeması ve CSV başlangıç verileriyle oluşturun, ardından geliştirme sunucusunu başlatın:

```sh
npm install
npx cds deploy
npm run watch
```

Sonraki çalıştırmalarda yalnızca şu komut yeterlidir:

```sh
npm run watch
```

Normal uygulama [http://localhost:4004/](http://localhost:4004/) adresinde çalışır.

## Kitap Yönetimi Arayüzü

`app/` klasöründeki çalışan CRUD web arayüzü [http://localhost:4004/](http://localhost:4004/) adresinden açılır ve `/admin/Books` OData V4 servisini kullanır. Harici CDN veya internet bağlantısı gerektirmez.

Arayüzde aşağıdaki kitap bilgileri oluşturulabilir ve düzenlenebilir:

- Kitap adı
- Açıklama
- Yazar
- Tür
- Stok
- Fiyat
- Para birimi

Integer kitap ID'si kullanıcı tarafından girilmez. Yeni kitap formu açılırken mevcut en yüksek ID bulunur ve sonraki ID otomatik olarak önerilir.

Ana tabloda şu sütunlar gösterilir:

- ID
- Kitap Adı
- Yazar
- Tür
- Stok
- Fiyat
- Para Birimi
- İşlemler

Arayüz kitaplar için gerçek CAP servisi üzerinden dört temel işlemi destekler:

- CREATE: `POST /admin/Books`
- READ: `GET /admin/Books`
- UPDATE: `PATCH /admin/Books(<ID>)`
- DELETE: `DELETE /admin/Books(<ID>)`

Silme işleminden önce kullanıcı onayı alınır. Başarılı işlemlerden sonra tablo yenilenir; backend doğrulama hataları Türkçe bir mesaj alanında gösterilir.

## Veritabanı

Normal geliştirme ortamı proje kökündeki kalıcı SQLite dosyasını kullanır:

```text
db.sqlite
```

Bu dosya `npx cds deploy` komutuyla `db/schema.cds` modeli ve `db/data/` CSV kayıtlarından oluşturulur. Arayüzden yapılan ekleme, güncelleme ve silme işlemleri CAP sunucusu kapatılıp yeniden açıldığında korunur.

`db.sqlite` yerel geliştirme verisidir ve `.gitignore` içindeki `*.sqlite` kuralı nedeniyle Git'e gönderilmez.

## Servisler

- `/admin/Books`: Kitaplar için CREATE, READ, UPDATE ve DELETE işlemleri.
- `/admin/Authors`: Yazar kayıtları ve kitap ilişkileri.
- `/admin/Genres`: Hiyerarşik tür kayıtları.
- `/admin/Currencies`: Arayüzde kullanılan para birimi kodları.
- `GET /browse/Books`: Salt okunur kitap kataloğu; yazar ve tür adlarını düzleştirilmiş biçimde döndürür. Stoku 111'in üzerindeki kitap başlıklarına `%11 discount` bilgisi eklenir.
- `POST /browse/submitOrder`: Basic Authentication ile `{ "book": 201, "quantity": 2 }` gövdesini alır ve stok miktarını atomik olarak düşürür.
- `/admin/$metadata` ve `/browse/$metadata`: OData V4 servis tanımları.

Örnek sorgular:

```text
http://localhost:4004/admin/Books?$select=ID,title,stock,price
http://localhost:4004/browse/Books?$select=ID,title,author,genre,stock
http://localhost:4004/admin/Authors?$select=ID,name&$expand=books($select=ID,title)
```

## Testler

```sh
npm test
```

Testler dinamik olarak seçilen boş bir portta geçici CAP sunucusu başlatır. Test profili `:memory:` SQLite kullanır; proje kökündeki kalıcı `db.sqlite` dosyasını değiştirmez veya silmez.

Mevcut testler katalog sorgusunu, entity ilişkilerini, sipariş sonrası stok değişimini ve admin doğrulama hatalarını kontrol eder.

## Proje Yapısı

```text
bookshop/
├── .vscode/
│   ├── launch.json      # npm start kullanan VS Code çalıştırma ayarı
│   └── tasks.json       # npm run watch görevi
├── app/                 # Çalışan kitap yönetimi CRUD web arayüzü
│   ├── index.html       # Kitap yönetimi sayfası ve formu
│   ├── app.js           # CRUD işlemleri ve CAP servisleriyle iletişim
│   └── style.css        # Arayüz tasarımı
├── db/
│   ├── schema.cds       # Books, Authors ve Genres veri modeli
│   └── data/            # CSV başlangıç verileri ve para birimleri
├── srv/
│   ├── admin-service.cds
│   ├── admin-constraints.cds
│   ├── cat-service.cds
│   └── cat-service.js   # Sipariş handler'ı
├── test/
│   └── bookshop.test.js # İzole HTTP entegrasyon testleri
├── db.sqlite            # Yerel kalıcı veritabanı; Git tarafından ignore edilir
├── .gitignore
├── eslint.config.mjs
├── package.json         # npm scriptleri ve CAP/SQLite yapılandırması
├── package-lock.json
└── README.md
```

`node-ogrenme/` kişisel Node.js alıştırmalarını içerir ve Bookshop uygulamasının parçası değildir.

Model ve servis yaklaşımı SAP'nin resmi [CAP Bookshop öğreticisini](https://cap.cloud.sap/docs/get-started/bookshop) temel alır.
![Lorem Picsum Gorsel](Ekran Görüntüsü (64).png)
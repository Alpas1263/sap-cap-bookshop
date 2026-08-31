# SAP CAP Bookshop

SAP CAP/CDS 10 ve SQLite kullanan bir kitap yönetimi uygulamasıdır. CAP servisleri ile Vanilla HTML, CSS ve JavaScript tabanlı web arayüzü aynı yerel sunucuda çalışır.

## Özellikler

- Kitapları yazar, tür, stok, fiyat ve para birimi bilgileriyle listeleme
- Yeni kitap ekleme
- Mevcut kitapları düzenleme
- Onay alarak kitap silme
- Yazar, tür ve para birimi verilerini CAP servislerinden yükleme
- SQLite üzerinde kalıcı yerel veri saklama
- CSV dosyalarından otomatik başlangıç verisi yükleme
- Sipariş sırasında stoğu atomik olarak azaltan katalog aksiyonu
- Bellek içi SQLite kullanan HTTP entegrasyon testleri

## Kurulum

Projeyi sıfır bir Windows 11 bilgisayara kurmak için aşağıdaki ayrıntılı kurulum rehberini takip edin:

[📘 Windows 11 Sıfırdan Kurulum Rehberi](./KURULUM.md)

Kurulum gereksinimleri, Visual Studio Code ile klonlama, doğru CAP/CDS komutları, SQLite deploy işlemi, başlangıç verilerinin kontrolü ve hata çözümleri bu rehberde açıklanmıştır. Kurulumun tek güncel kaynağı `KURULUM.md` dosyasıdır.

## Hızlı Başlangıç

> Ayrıntılı açıklamalar ve hata çözümleri için [KURULUM.md](./KURULUM.md) dosyasını takip edin. Aşağıdaki komutları `package.json` dosyasının bulunduğu proje kökünde, belirtilen sırayla çalıştırın.

```powershell
npm.cmd ci
npx.cmd -p @sap/cds-dk@10 cds --version
npx.cmd -p @sap/cds-dk@10 cds deploy --to sqlite
Test-Path .\db.sqlite
npm.cmd start
```

İlk `npx.cmd -p` kullanımında npm paket indirme onayı sorarsa `y` yazıp `Enter` tuşuna basın. `Test-Path .\db.sqlite` çıktısı `True` olmalıdır. Deploy başarısızsa veya `db.sqlite` oluşmadıysa uygulamayı başlatmayın.

Sunucu başladıktan sonra uygulamayı açın:

<http://localhost:4004/>

## Servisler

- `GET /admin/Books`: Kitapları listeler.
- `POST /admin/Books`: Yeni kitap oluşturur.
- `PATCH /admin/Books(<ID>)`: Kitabı günceller.
- `DELETE /admin/Books(<ID>)`: Kitabı siler.
- `/admin/Authors`: Yazarları ve kitap ilişkilerini sunar.
- `/admin/Genres`: Hiyerarşik tür kayıtlarını sunar.
- `/admin/Currencies`: Para birimi listesini sağlar.
- `GET /browse/Books`: Yazar ve tür adları düzleştirilmiş salt okunur kataloğu sunar.
- `POST /browse/submitOrder`: Kitap ID'si ve pozitif miktar alarak stoğu atomik biçimde azaltır.
- `/admin/$metadata` ve `/browse/$metadata`: OData V4 servis tanımlarıdır.

Örnek sorgular:

```text
http://localhost:4004/admin/Books?$select=ID,title,stock,price
http://localhost:4004/browse/Books?$select=ID,title,author,genre,stock
http://localhost:4004/admin/Authors?$select=ID,name&$expand=books($select=ID,title)
```

## Testler

Testleri proje kökünde çalıştırın:

```powershell
npm.cmd test
```

Testler dinamik olarak seçilen boş bir portta geçici CAP sunucusu başlatır ve `:memory:` SQLite veritabanını kullanır. Proje kökündeki kalıcı `db.sqlite` dosyasını değiştirmez.

Mevcut doğrulama sonucu:

- 4 test
- 3 başarılı
- 1 başarısız

Başarısız test `admin constraints reject invalid book data` testidir. Servis `400` döndürürken test `412` beklemektedir. Bu durum kurulum veya SQLite deploy problemi değil, test beklentisi ile mevcut CAP yanıtı arasındaki uyuşmazlıktır.

## Proje Yapısı

```text
sap-cap-bookshop/
├── .vscode/             # VS Code görevleri ve eklenti önerileri
├── app/
│   ├── index.html       # Kitap yönetimi sayfası
│   ├── app.js           # CRUD işlemleri ve servis istekleri
│   └── style.css        # Arayüz tasarımı
├── db/
│   ├── schema.cds       # Books, Authors ve Genres veri modeli
│   └── data/            # CSV başlangıç verileri
├── srv/
│   ├── admin-service.cds
│   ├── admin-constraints.cds
│   ├── cat-service.cds
│   └── cat-service.js
├── test/
│   └── bookshop.test.js # HTTP entegrasyon testleri
├── .gitignore
├── package.json
├── package-lock.json
├── KURULUM.md           # Ayrıntılı Windows 11 kurulum rehberi
└── README.md
```

`node_modules` ve `db.sqlite` kurulum sırasında yerelde oluşturulur ve Git'e eklenmez. `node-ogrenme/` klasörü Bookshop uygulamasının parçası değildir.

## Teknolojiler

- Node.js 22 veya üzeri
- SAP CAP / `@sap/cds` 10
- `@cap-js/sqlite` 3
- SQLite
- OData V4
- Vanilla HTML, CSS ve JavaScript
- Node.js yerleşik test runner

# SAP CAP Bookshop Kurulum Rehberi

Bu rehber, projeyi daha önce hiç bulunmadığı Windows 11 bilgisayarına GitHub'dan indirip çalıştırmak için hazırlanmıştır. Komutlar PowerShell veya VS Code terminalinde, belirtilen sırayla çalıştırılmalıdır.

## 1. Proje Hakkında

SAP CAP/CDS 10 ve SQLite kullanan bu uygulama; kitap, yazar ve tür verilerini yöneten servisler ile tarayıcıdan kullanılabilen bir CRUD arayüzü içerir. Kalıcı yerel veritabanı proje kökündeki `db.sqlite` dosyasıdır.

## 2. Gereksinimler

- 64 bit Windows 11
- Git
- Node.js 22 veya üzeri (`@sap/cds` 10 bunu gerektirir)
- Node.js ile birlikte gelen npm
- İnternet bağlantısı (repository ve npm paketlerini indirmek için)

VS Code zorunlu değildir; ancak projeyi düzenlemek ve terminal komutlarını çalıştırmak için kullanılabilir. Global `@sap/cds-dk`, ayrı bir SQLite uygulaması veya ayrı bir veritabanı sunucusu kurmak gerekmez. Proje, gereken CAP ve SQLite paketlerini kendi bağımlılıkları içinde kurar ve komutlar `npx`/npm scriptleri üzerinden çalışır.

## 3. Gerekli Programların Kurulması

### Git

Git for Windows'u resmi indirme sayfasından indirip varsayılan seçeneklerle kurun:

<https://git-scm.com/download/win>

Yeni bir terminal açıp kurulumu doğrulayın:

```powershell
git --version
```

### Node.js

Node.js'in 22 veya daha yeni bir LTS sürümünü resmi siteden indirip kurun:

<https://nodejs.org/en/download>

Kurulumdan sonra açık terminalleri kapatıp yeni bir terminal açın ve doğrulayın:

```powershell
node --version
npm --version
```

`node --version` çıktısı `v22` veya daha yüksek olmalıdır. PowerShell `npm.ps1` çalıştırılmasına izin vermiyorsa yürütme politikasını değiştirmek zorunda değilsiniz; bu rehberdeki npm ve npx komutlarını `npm.cmd` ve `npx.cmd` biçiminde çalıştırabilirsiniz.

### VS Code (isteğe bağlı)

VS Code'u <https://code.visualstudio.com/> adresinden kurabilirsiniz. Repository'deki `.vscode/extensions.json` bazı yararlı eklentileri önerir; bunlar uygulamayı çalıştırmak için zorunlu değildir.

## 4. Projeyi GitHub'dan İndirme

Projeyi koymak istediğiniz üst klasöre geçin. Yolda boşluk varsa yolu çift tırnak içine alın:

```powershell
cd "C:\Users\KULLANICI_ADINIZ\Documents"
git clone https://github.com/Alpas1263/sap-cap-bookshop.git
cd sap-cap-bookshop
```

Doğru klasörde olduğunuzu kontrol edin:

```powershell
Get-Location
Get-ChildItem
```

Listede en az `package.json`, `package-lock.json`, `db`, `srv` ve `app` görünmelidir.

## 5. Proje Bağımlılıklarını Kurma

Repository'de `package-lock.json` bulunduğu için temiz ilk kurulumda kilitli sürümleri aynen kuran `npm ci` kullanılmalıdır:

```powershell
npm.cmd ci
```

Bu komut `node_modules` klasörünü oluşturur ve `@sap/cds` ile `@cap-js/sqlite` dahil gerekli paketleri kurar. `node_modules` GitHub'dan gelmez ve Git tarafından izlenmez.

Yerel CAP kurulumunu doğrulayın:

```powershell
npx.cmd cds --version
```

Bu komut proje içindeki `@sap/cds` kurulumunu görmelidir. Global `cds` kurulumu gerekmemektedir.

## 6. Veritabanı Kurulumu

Proje SQLite kullanır. Yapı `db/schema.cds` dosyasından, başlangıç kayıtları ise `db/data/` altındaki CSV dosyalarından alınır. Yeni bilgisayarda kalıcı veritabanını oluşturmak ve CSV verilerini yüklemek için proje kökünde şu komutu çalıştırın:

```powershell
npx.cmd cds deploy --to sqlite
```

Komut başarıyla tamamlandığında proje kökünde `db.sqlite` oluşur. Bu dosya `.gitignore` kapsamındadır; GitHub'dan indirilmez ve her yeni kurulumda deploy komutuyla yerelde üretilir.

CSV dosyalarını elle içe aktarmayın. Deploy işlemi `db/data/` altındaki kitap, yazar, tür ve para birimi verilerini otomatik yükler.

> Uyarı: Mevcut ve değerli bir `db.sqlite` dosyası üzerinde yeniden deploy etmek veritabanı yapısını/verilerini yeniden kurabilir. Bu komut burada yalnızca sıfır kurulum senaryosu için verilmektedir.

## 7. Uygulamayı Çalıştırma

Normal çalıştırma:

```powershell
npm.cmd start
```

Kaynak dosyalarını izleyip değişikliklerde sunucuyu yeniden başlatan geliştirme modu:

```powershell
npm.cmd run watch
```

Komutlardan yalnızca birini çalıştırın ve sunucu açıkken terminali kapatmayın. Varsayılan port başka bir ayarla değiştirilmediyse uygulama şu adreste açılır:

<http://localhost:4004/>

Bu kök adres `app/` içindeki kitap yönetimi arayüzünü sunar.

## 8. Uygulamanın Çalıştığını Kontrol Etme

Terminalde CAP sunucusunun başladığını ve `localhost:4004` adresini dinlediğini belirten çıktı görülmelidir. Tarayıcıda aşağıdaki adresleri kontrol edin:

- Web arayüzü: <http://localhost:4004/>
- Katalog kitapları: <http://localhost:4004/browse/Books>
- Yönetim kitapları: <http://localhost:4004/admin/Books>
- Yazarlar: <http://localhost:4004/admin/Authors>
- Türler: <http://localhost:4004/admin/Genres>

Başlangıç verileri doğru yüklendiyse web arayüzünde beş kitap kaydı görünür. Yönetim servisi kitap ekleme, düzenleme ve silme işlemlerini; katalog servisi ise salt okunur kitap listesini ve sipariş aksiyonunu sağlar.

Sunucuyu durdurmak için çalıştığı terminalde `Ctrl+C` tuşlarına basın.

## 9. Testleri Çalıştırma

Sunucuyu ayrıca başlatmanız gerekmez. Testler boş bir port seçer, CAP sunucusunu test profiliyle ve bellek içi SQLite veritabanıyla kendileri çalıştırır:

```powershell
npm.cmd test
```

Testler katalog verilerini ve yazar-kitap ilişkisini, sipariş sırasında stok azaltma/hata durumlarını ve yönetim servisindeki zorunlu alan, ilişki ve aralık doğrulamalarını kontrol eder. Başarılı çalışmada tüm testlerin geçtiği raporlanır. Test profili `:memory:` kullandığı için kalıcı `db.sqlite` değiştirilmez.

> Mevcut `2` branch'i üzerinde rehber hazırlanırken yapılan doğrulamada 4 testin 3'ü geçti. `admin constraints reject invalid book data` testi, servis `400` döndürürken test `412` beklediği için başarısız oldu. Bu durum bağımlılık veya veritabanı kurulumunun eksik olduğu anlamına gelmez; branch'teki test beklentisi ile mevcut CAP yanıtı arasındaki uyuşmazlıktır.

## 10. Projeyi Daha Sonra Tekrar Açma

Bilgisayar yeniden başlatıldığında Git'i, Node.js'i, paketleri veya veritabanını yeniden kurmanız gerekmez. Terminal açıp proje klasörüne geçin ve uygulamayı başlatın:

```powershell
cd "C:\Users\KULLANICI_ADINIZ\Documents\sap-cap-bookshop"
npm.cmd start
```

Geliştirme sırasında otomatik yeniden başlatma isterseniz ikinci komut yerine `npm.cmd run watch` kullanın.

## 11. GitHub'dan Yeni Güncellemeleri Alma

Önce proje klasöründe yerel değişiklik olup olmadığını kontrol edin:

```powershell
git status
```

Çalışma alanı temizse açık branch için güncellemeleri alın:

```powershell
git pull
```

`package-lock.json` güncellendiyse bağımlılıkları tekrar eşitleyin:

```powershell
npm.cmd ci
```

Yerel değişiklik varken `git pull` çakışma oluşturabilir. Böyle bir durumda değişiklikleri silmeyin; önce commit etme veya güvenli biçimde saklama konusunda karar verin.

## 12. Sorun Giderme

### `git`, `node` veya `npm` komutu bulunamıyor

Kurulumdan sonra bütün terminalleri ve VS Code'u kapatıp yeniden açın. Ardından `git --version`, `node --version` ve `npm.cmd --version` komutlarını tekrar deneyin. Sorun sürerse ilgili programı yeniden kurarken PATH seçeneğinin etkin olduğundan emin olun.

### PowerShell, `npm.ps1` çalıştırılmasını engelliyor

Komutları `npm`/`npx` yerine bu rehberdeki gibi `npm.cmd`/`npx.cmd` ile çalıştırın. Bu yöntem PowerShell yürütme politikasını değiştirmez.

### `cds` komutu bulunamıyor

Bu projede global `cds` komutu gerekli değildir. Önce bağımlılıkları kurup yerel aracı kullanın:

```powershell
npm.cmd ci
npx.cmd cds --version
```

### `node_modules` yok veya paket bulunamıyor

Proje kökünde olduğunuzu doğrulayıp çalıştırın:

```powershell
npm.cmd ci
```

### `db.sqlite` oluşmadı veya başlangıç kayıtları görünmüyor

Komutu `package.json` dosyasının bulunduğu proje kökünde çalıştırdığınızdan emin olun:

```powershell
npx.cmd cds deploy --to sqlite
```

Komut çıktısında hata varsa önce o hatayı çözün. CSV kaynakları `db/data/` altında bulunmalıdır.

### `localhost:4004` açılmıyor

`npm.cmd start` komutunun çalıştığı terminalde hata olup olmadığını kontrol edin. Terminal kapanmışsa sunucu da kapanmıştır. Adresin `http://localhost:4004/` olduğundan ve HTTPS kullanmadığınızdan emin olun.

### Port 4004 kullanımda

Önce aynı projenin başka bir terminalde çalışıp çalışmadığını kontrol edip gerekiyorsa o terminalde `Ctrl+C` ile durdurun. Başka uygulamayı durduramıyorsanız geçici farklı port kullanabilirsiniz:

```powershell
$env:PORT=4005
npm.cmd start
```

Bu durumda adres `http://localhost:4005/` olur. Terminal için ayarlanan değişken yeni terminal açıldığında kalıcı olmaz.

### Paket indirme hatası

İnternet bağlantısını ve kurumsal proxy/VPN ayarlarını kontrol edip `npm.cmd ci` komutunu yeniden deneyin. Hata mesajını incelemeden `package-lock.json` dosyasını silmeyin.

### Bağımlılık kurulumu ciddi biçimde bozuldu

Önce normal `npm.cmd ci` komutunu yeniden deneyin. Sorun devam ederse `node_modules` klasörünün yeniden oluşturulması son seçenek olabilir; bu klasör indirilen paketlerden oluşur. `package-lock.json` dosyasını silmeyin. PowerShell'de yalnızca doğru proje klasöründe olduğunuzu doğruladıktan sonra:

```powershell
Remove-Item -Recurse -Force .\node_modules
npm.cmd ci
```

Bu işlem kaynak kodunu veya `db.sqlite` dosyasını silmez, ancak paketleri yeniden indirir.

## Kurulum Sırası Özeti

Sıfır bir Windows 11 bilgisayarda uygulanacak temel sıra şöyledir:

```powershell
git clone https://github.com/Alpas1263/sap-cap-bookshop.git
cd sap-cap-bookshop
npm.cmd ci
npx.cmd cds deploy --to sqlite
npm.cmd start
```

Ardından <http://localhost:4004/> adresini açın.

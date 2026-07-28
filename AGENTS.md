# Codex Project Instructions

## Repository

- Repository: https://github.com/toys77/Tuner.git
- Default branch: main

## Automatic GitHub Update

このプロジェクトでは、ユーザーから依頼されたコード・UI・デザイン・設定の変更が完了したら、毎回自動的にGitHubを更新してください。

ファイルを編集しただけで作業を終了したり、Gitコマンドの説明だけを提示したりしないでください。

変更完了後は、必ず以下の手順を実行してください。

1. package.jsonがあるプロジェクトルートで作業していることを確認する
2. git statusで変更内容を確認する
3. 意図したファイル以外が変更されていないか確認する
4. npm testを実行する
5. npm run buildを実行する
6. テストとビルドが成功したら、必要なファイルだけをステージングする
7. 変更内容を表す簡潔なコミットメッセージを作成する
8. originが https://github.com/toys77/Tuner.git を指していることを確認する
9. リモートmainの更新状況を確認する
10. origin mainへpushする
11. 最後にコミットハッシュとpush結果を報告する

## GitHubへアップロードしないもの

以下はコミットおよびpushしないでください。

- node_modules/
- dist/
- outputs/
- work/
- .agents/
- .codex/
- .env
- .env.*
- APIキー
- アクセストークン
- パスワード
- 一時ファイル
- キャッシュ
- アプリで使用しない生成画像
- ローカル専用の設定

ただし、アプリで正式に使用する画像素材は、public/assetsまたはsrc/assetsへ移動したうえでコミットしてください。

## Safety Rules

- git push --forceを使用しない
- git push --force-with-leaseを使用しない
- git reset --hardを勝手に使用しない
- リモートの変更を黙って上書きしない
- コンフリクトが発生した場合は、無理にpushせず状況を報告する
- テストまたはビルドが失敗した状態ではpushしない
- 変更がない場合は空コミットを作成しない
- ユーザーが作成した既存ファイルを勝手に削除しない
- 機密情報を発見した場合はコミット対象から除外する

## Definition of Done

以下をすべて完了した時点で、依頼された作業を完了とみなします。

- 依頼内容を実装した
- 表示と動作を確認した
- テストを通過した
- ビルドを通過した
- 変更をコミットした
- toys77/Tuner の main ブランチへpushした
- 最新コミットハッシュとpush結果を報告した

認証エラー、テスト失敗、ビルド失敗、またはリモート競合がある場合のみ、pushせず理由を報告してください。

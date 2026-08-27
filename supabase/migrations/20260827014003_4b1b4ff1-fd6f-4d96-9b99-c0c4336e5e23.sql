CREATE POLICY "maideres lecture" ON storage.objects FOR SELECT TO authenticated, anon
  USING (bucket_id = 'maideres');
CREATE POLICY "maideres upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'maideres' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "maideres update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'maideres' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "maideres delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'maideres' AND (storage.foldername(name))[1] = auth.uid()::text);
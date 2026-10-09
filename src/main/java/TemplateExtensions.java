import io.quarkiverse.roq.frontmatter.runtime.model.DocumentPage;
import io.quarkiverse.roq.frontmatter.runtime.model.Page;
import io.quarkiverse.roq.frontmatter.runtime.model.RoqCollection;
import io.quarkus.qute.TemplateExtension;

import java.text.Collator;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

public class TemplateExtensions {

    @TemplateExtension
    public static List<DocumentPage> alphabetical(RoqCollection collection) {
        Collator collator = Collator.getInstance(Locale.FRENCH);
        collator.setStrength(Collator.PRIMARY);
        return collection.stream()
                .sorted(Comparator.comparing(DocumentPage::title, collator)
                        .thenComparing(DocumentPage::id))
                .toList();
    }

    @TemplateExtension
    public static String collectionTitles(RoqCollection collection) {
        return "['%s']".formatted(alphabetical(collection).stream()
                .map(DocumentPage::title)
                        .map(value -> value.replaceAll("'", "\\\\'"))
                .collect(Collectors.joining("','")));
    }

    @TemplateExtension
    public static String allModules(RoqCollection collection) {
        return alphabetical(collection).stream()
                .map(document -> document.url().relative())
                .collect(Collectors.joining(","));
    }

    @TemplateExtension
    public static String nextModule(Page page) {
        List<DocumentPage> modules = alphabetical(page.site().collections().get("modules"));
        if (page.url().equals(page.site().url()))
           return modules.stream()
                   .findFirst()
                   .map(doc -> doc.url().relative())
                   .orElse(page.site().url().fromRoot("leaderboard").absolute());
        for (int index = 0; index < modules.size() - 1; index++) {
            if (modules.get(index).id().equals(page.id())) {
                return modules.get(index + 1).url().relative();
            }
        }
        return page.site().url().fromRoot("leaderboard").absolute();
    }
}
